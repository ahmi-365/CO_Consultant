import RefactoredCloudVaultLayout from "@/components/RefactoredCloudVaultLayout";
import React from "react";
import { Outlet } from "react-router-dom";

export const CustomerLayout = () => {
  return (
    <RefactoredCloudVaultLayout>
      <Outlet />
    </RefactoredCloudVaultLayout>
  );
};
