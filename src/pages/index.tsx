import { Inter } from "next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
} from "wagmi";
import { abi as PayPoolABI } from "../../src/abi/PayPoolABI.json";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { address: connectedUserWalletAddress } = useAccount();

  const {
    config: configUpdateReferrerId,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: "0x39Aeb70797da90C7b335669EF1a7A0930Fc759E8",
    abi: PayPoolABI,
    functionName: "updateReferrerId",
    args: [connectedUserWalletAddress, 1],
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

      <div>
        <button
          disabled={!writeUpdateReferrerId || isLoading}
          onClick={() =>
            writeUpdateReferrerId
              ? writeUpdateReferrerId()
              : console.log("no writeUpdateReferrerId")
          }
        >
          {isLoading ? "Minting..." : "Mint"}
        </button>
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
    </main>
  );
}
