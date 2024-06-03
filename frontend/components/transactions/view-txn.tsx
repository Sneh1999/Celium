import { getViemChainFromChainName } from "@/lib/chains";
import { Chain } from "@prisma/client";
import Link from "next/link";

export function ViewTransaction({
  hash,
  chain,
}: {
  hash: `0x${string}` | null;
  chain: Chain;
}) {
  const viemChain = getViemChainFromChainName(chain);
  const blockExplorerLink = `${viemChain.blockExplorers?.default.url}/tx`;

  if (!hash) return null;
  return (
    <div className="flex flex-col gap-2 rounded-md border">
      <span>View your pending transaction</span>
      <Link
        href={`${blockExplorerLink}/${hash}`}
        target="_blank"
        className="text-blue-500 hover:text-blue-600"
      >
        {hash.substring(0, 6)}...{hash.substring(38)}
      </Link>
    </div>
  );
}
