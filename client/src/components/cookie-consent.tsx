"use client";

import { useState } from "react";
import { useCookies } from "@/hooks/use-cookies";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown } from "lucide-react";

export function CookieConsent() {
  const { hasConsented, isLoaded, acceptAll, acceptNecessary, setCustomConsent } = useCookies();
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [customConsent, setCustomConsentState] = useState({
    analytics: false,
    preferences: false,
  });

  // Don't show the banner if the user has already consented or if the consent state hasn't loaded yet
  if (hasConsented || !isLoaded) {
    return null;
  }

  const handleCustomConsentChange = (key: "analytics" | "preferences") => {
    setCustomConsentState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveCustomConsent = () => {
    setCustomConsent(customConsent);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg transition-all duration-300">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Cookie Preferences</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleCollapse} 
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>

            {showCustomOptions ? (
              <div className="space-y-4 py-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="necessary" 
                    checked={true} 
                    disabled={true}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="necessary" className="font-medium">
                      Necessary Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      These cookies are essential for the website to function properly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="analytics" 
                    checked={customConsent.analytics}
                    onCheckedChange={() => handleCustomConsentChange("analytics")}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="analytics" className="font-medium">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      These cookies help us understand how visitors interact with our website.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="preferences" 
                    checked={customConsent.preferences}
                    onCheckedChange={() => handleCustomConsentChange("preferences")}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="preferences" className="font-medium">
                      Preference Cookies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      These cookies allow the website to remember choices you make.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {showCustomOptions ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomOptions(false)}
                    className="sm:w-auto w-full"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSaveCustomConsent}
                    className="sm:w-auto w-full"
                  >
                    Save Preferences
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={acceptNecessary}
                    className="sm:w-auto w-full"
                  >
                    Necessary Only
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomOptions(true)}
                    className="sm:w-auto w-full"
                  >
                    Customize
                  </Button>
                  <Button 
                    onClick={acceptAll}
                    className="sm:w-auto w-full"
                  >
                    Accept All
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
