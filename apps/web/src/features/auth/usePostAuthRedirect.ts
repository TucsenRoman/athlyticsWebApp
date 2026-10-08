// src/features/auth/usePostAuthRedirect.ts
import { useNavigate } from "react-router-dom";

export function usePostAuthRedirect() {
  const navigate = useNavigate();

  function redirectAfterAuth() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
      navigate("/radar", { replace: true });
    } else {
      navigate("/workspace", { replace: true });
    }
  }

  return { redirectAfterAuth };
}
// ~FUTURE PROOF
// if (!profile.onboarded) → /onboarding
// else if (mobile) → /radar
// else → /workspace
