import { Inter } from "next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
  sepolia,
} from "wagmi";
import { abi as PayPoolABI } from "../../src/abi/PayPoolABI.json";
import { Button } from "@/components/ui/button";
import {
  createPublicClient,
  http,
  parseAbiItem,
  parseUnits,
  stringify,
} from "viem";

const inter = Inter({ subsets: ["latin"] });

const getLogs = async () => {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const logs = await publicClient.getLogs({
    address: "0x287B0e934ed0439E2a7b1d5F0FC25eA2c24b64f7",
    event: parseAbiItem(
      "event Swap(address indexed, address indexed, int256 , int256 , uint160 , uint128, int24)"
    ),
    // inputs: [
    //   { type: "address", indexed: true, name: "from" },
    //   { type: "address", indexed: true, name: "to" },
    // ],
    // args: {
    //   from: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    //   to: "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
    // },
    fromBlock: BigInt(4575280),
    toBlock: BigInt(4575285),
  });
  console.log(stringify(logs));
  return logs;
};

export default function Home() {
  const { address: connectedUserWalletAddress } = useAccount();
  const referrerID = 1;

  const {
    config: configUpdateReferrerId,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: "0x39Aeb70797da90C7b335669EF1a7A0930Fc759E8",
    abi: PayPoolABI,
    functionName: "updateReferrerId",
    args: [connectedUserWalletAddress, referrerID],
  });

  const {
    write: writeUpdateReferrerId,
    data,
    error,
    isError,
  } = useContractWrite(configUpdateReferrerId);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <ConnectButton />
      </div>

      <div className="flex gap-4">
        <Button
          disabled={!writeUpdateReferrerId || isLoading}
          onClick={() =>
            writeUpdateReferrerId
              ? writeUpdateReferrerId()
              : console.log("no writeUpdateReferrerId")
          }
        >
          {isLoading ? "Pending..." : "Get a Referrer ID"}
        </Button>
        <Button>Tie a referee to a referrer ID</Button>
        <Button>
          Start a campaign for a contract address and add funds to pool
        </Button>
        <Button onClick={() => getLogs()}>Get logs</Button>
        <Button>Referral Successful</Button>
        {isSuccess && (
          <div>
            Successfully updated referrerId to 1.
            <div>
              <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
            </div>
          </div>
        )}
        {(isPrepareError || isError) && (
          <div>Error: {(prepareError || error)?.message}</div>
        )}
      </div>
      <div></div>
    </main>
  );
}
