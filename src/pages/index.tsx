import { Inter } from "next/font/google";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useWaitForTransaction,
  sepolia,
  useContractRead,
  erc20ABI,
} from "wagmi";
import { abi as PayPoolABI } from "../../src/abi/PayPoolABI.json";
import { Button } from "@/components/ui/button";
import {
  createPublicClient,
  formatEther,
  http,
  parseAbiItem,
  parseEther,
  parseUnits,
  stringify,
} from "viem";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

const Home = () => {
  const { address: connectedUserWalletAddress } = useAccount();
  const referrerID = 123;
  const PayPoolAddress =
    "0x8864977d9788222e28e0917797d6620c3b96585a" as `0x${string}`; // Sepolia

  const [contractAddress, setContractAddress] = useState("");
  const [share, setShare] = useState("");
  const [log, setLogs] = useState("");
  const [successContractAddress, setSuccessContractAddress] = useState("");
  const [successReferrer, setSuccessReferrer] = useState("");
  const [successReferee, setSuccessReferee] = useState("");
  const [successShare, setSuccessShare] = useState("");

  // UpdateReferrerId
  const {
    config: configUpdateReferrerId,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: PayPoolAddress,
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

  // Get ReferrerID
  const { data: currentReferrerID } = useContractRead({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "referrerIds",
    args: [connectedUserWalletAddress],
  });

  // Get RefereeID
  const { data: currentRefereeID } = useContractRead({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "refereeIds",
    args: [connectedUserWalletAddress],
  });

  // Get MemberBalance
  const { data: contractBalance } = useContractRead({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "memberBalance",
    args: ["0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad"], // Uniswap Unviersal router on sepolia, TODO: Move to const
  });

  // UpdateRefereeId
  const {
    config: configUpdateRefereeId,
    error: prepareUpdateRefereeIdError,
    isError: isPrepareUpdateRefereeIdError,
  } = usePrepareContractWrite({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "updateRefereeId",
    args: [connectedUserWalletAddress, referrerID],
  });

  const {
    write: writeUpdateRefereeId,
    // data,
    // error,
    // isError,
  } = useContractWrite(configUpdateRefereeId);

  // Approve a token
  const { config: configApproveToken } = usePrepareContractWrite({
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", //TODO: UNI TOKEN, move this to const
    abi: erc20ABI,
    functionName: "approve",
    args: [PayPoolAddress, parseEther(share)],
  });

  const {
    write: writeApproveTokens,
    // data,
    // error,
    // isError,
  } = useContractWrite(configApproveToken);

  // Start a campaign
  const {
    config: configStartCampaign,
    error: prepareStartCampaignError,
    isError: isPrepareStartCampaignError,
  } = usePrepareContractWrite({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "startAMembership",
    args: [contractAddress, parseEther(share)],
  });

  const {
    write: writeStartCampaign,
    // data,
    // error,
    // isError,
  } = useContractWrite(configStartCampaign);

  // Referral Success
  const {
    config: configSuccessfulReferral,
    error: prepareSuccessfulReferralError,
    isError: isPrepareSuccessfulReferralError,
  } = usePrepareContractWrite({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "successfulReferral",
    args: [
      successContractAddress,
      successReferrer,
      successReferee,
      parseEther(successShare),
    ],
  });

  const {
    write: writeSuccessfulReferral,
    // data,
    // error,
    // isError,
  } = useContractWrite(configSuccessfulReferral);

  // Withdraw referrer shares
  const {
    config: configPullReferrerShare,
    error: preparePullReferrerShareError,
    isError: isPreparePullReferrerShareError,
  } = usePrepareContractWrite({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "pullReferrerShare",
  });

  const {
    write: writePullReferrerShare,
    // data,
    // error,
    // isError,
  } = useContractWrite(configPullReferrerShare);

  // Withdraw referee shares
  const {
    config: configPullRefereeShare,
    error: preparePullRefereeShareError,
    isError: isPreparePullRefereeShareError,
  } = usePrepareContractWrite({
    address: PayPoolAddress,
    abi: PayPoolABI,
    functionName: "pullRefereeShare",
  });

  const {
    write: writePullRefereeShare,
    // data,
    // error,
    // isError,
  } = useContractWrite(configPullRefereeShare);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <ConnectButton />
      </div>

      <div>
        <div>
          current referrer ID:
          {currentReferrerID?.toString()}
        </div>
        <div>
          current wallet address is tied to ID:
          {currentRefereeID?.toString()}
        </div>
        <div>
          Current contract campaign balance: {contractBalance?.toString()}
        </div>
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
        <Button
          disabled={!writeUpdateReferrerId || isLoading}
          onClick={() =>
            writeUpdateRefereeId
              ? writeUpdateRefereeId()
              : console.log("no writeUpdateRefereeId")
          }
        >
          Tie a referee to a referrer ID
        </Button>
        <div className="flex-row gap-4 justify-around">
          <Input
            className="gap-4"
            placeholder="contract address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
          <Input
            placeholder="share"
            value={share}
            onChange={(e) => setShare(e.target.value)}
          />
          {/* Start a campaign for a contract address and add funds to pool */}
          <Button
            onClick={() =>
              writeApproveTokens
                ? writeApproveTokens()
                : console.log("writeApproveTokens void")
            }
          >
            Approve Tokens
          </Button>
          <Button
            disabled={!writeStartCampaign}
            onClick={() =>
              writeStartCampaign
                ? writeStartCampaign()
                : console.log("no writeStartCampaign")
            }
          >
            Start a campaign
          </Button>
        </div>
        <Button onClick={() => getLogs()}>Get logs</Button>
        <div>
          {/* address memberContractAddress, address referrer, address referee, uint256 share)
           */}
          <Input
            placeholder="contract address"
            value={successContractAddress}
            onChange={(e) => setSuccessContractAddress(e.target.value)}
          />
          <Input
            placeholder="referrer"
            value={successReferrer}
            onChange={(e) => setSuccessReferrer(e.target.value)}
          />
          <Input
            placeholder="referee"
            value={successReferee}
            onChange={(e) => setSuccessReferee(e.target.value)}
          />
          <Input
            placeholder="share"
            value={successShare}
            onChange={(e) => setSuccessShare(e.target.value)}
          />
          <Button
            onClick={() =>
              writeSuccessfulReferral
                ? writeSuccessfulReferral()
                : console.log("writeSuccessfulReferral void")
            }
          >
            Referral Successful
          </Button>
        </div>
        <div className="flex-row">
          <Button
            className="gap-4"
            onClick={() =>
              writePullReferrerShare
                ? writePullReferrerShare()
                : console.log("writePullReferrerShare void")
            }
          >
            Withdraw referrer share
          </Button>
          <Button
            onClick={() =>
              writePullRefereeShare
                ? writePullRefereeShare()
                : console.log("writePullRefereeShare void")
            }
          >
            Withdraw referee share
          </Button>
          <Button>Withdraw service share</Button>
        </div>
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
};

export default Home;
