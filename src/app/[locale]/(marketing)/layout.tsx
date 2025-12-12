import React from "react";

import MarketingBackground from "./_components/marketing-background";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/comp-582";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <MarketingBackground />
      <Navbar />
      <div className="relative z-10">{children}</div>
      <Footer />
    </>
  );
};

export default layout;
