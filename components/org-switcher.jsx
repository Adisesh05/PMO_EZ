"use client";

import { usePathname } from "next/navigation";
import {
  OrganizationSwitcher,
  SignedIn,
  useOrganization,
  useUser,
} from "@clerk/nextjs";

const OrgSwitcher = () => {
  const { isLoaded } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  if (!isLoaded || !isUserLoaded) {
    return null;
  }

  return (
    <div className="flex justify-end mt-1">
      <SignedIn>
        <OrganizationSwitcher
          hidePersonal
          createOrganizationMode={
            pathname === "/onboarding" ? "navigation" : "modal"
          }
          afterCreateOrganizationUrl="/organization/:slug"
          afterSelectOrganizationUrl="/organization/:slug"
          createOrganizationUrl="/onboarding"
          appearance={{
            elements: {
              organizationSwitcherTrigger: {
                border: "2px solid white",
                borderRadius: "0.375rem",
                padding: "0.5rem 1.25rem",
                backgroundColor: "transparent",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }
              },
              organizationSwitcherTriggerIcon: {
                color: "white"
              },
              organizationSwitcherPopoverCard: {
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                color: "white"
              },
              organizationSwitcherPopoverActionButton: {
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }
              }
            },
            variables: {
              colorPrimary: "#3b82f6",
              colorText: "#ffffff",
              colorTextSecondary: "#d1d5db",
              colorBackground: "#1f2937",
              colorInputBackground: "#374151",
              colorInputText: "#ffffff"
            }
          }}
        />
      </SignedIn>
    </div>
  );
};

export default OrgSwitcher;