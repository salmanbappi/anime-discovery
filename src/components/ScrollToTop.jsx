import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Scroll to top on new navigation (PUSH) or REPLACE
    // Don't scroll on POP (Back/Forward) to allow browser restoration
    if (navType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navType]);

  return null;
}

export default ScrollToTop;
