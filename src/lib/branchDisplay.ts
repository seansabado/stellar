export function toDisplayBranchName(input: {
  branchId?: string;
  branchName?: string;
}): string {
  const branchId = (input.branchId || "").trim().toLowerCase();
  const branchName = (input.branchName || "").trim().toLowerCase();

  if (branchId === "branch-hq" || branchName.includes("makati central")) {
    return "Demo HQ";
  }

  if (branchId === "branch-east" || branchName.includes("east")) {
    return "Demo East Branch";
  }

  return input.branchName || "Demo Branch";
}
