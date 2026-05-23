import { useEffect, useState } from "react";

const useMobileSize = () => {
  const [isMobileSize, setIsMobileSize] = useState(false);

  useEffect(() => {
    setIsMobileSize(window.matchMedia("(max-width: 767px)").matches);
    const handleResize = () => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        setIsMobileSize(true);
      } else {
        setIsMobileSize(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { isMobileSize };
};

export default useMobileSize;
