import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import getFinger from "../hooks/getFinger";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    email: authUser?.email,
    otp: "",
  });

  useEffect(() => {
    if (!authUser?.email) return;
    const fetchFingerprint = async () => {
      const { fingerPrint } = await getFinger();
      setFormState(prev => ({ ...prev, email: authUser.email, fingerPrint }));
    };
    fetchFingerprint();
  }, [authUser?.email]);



  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("email verified succesfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };


  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">verify Your email</h1>

          <form onSubmit={handleSubmit} className="space-y-6">


            <div className="form-control">
              <label className="label">
                <span className="label-text">OTP</span>
              </label>
              <input
                type="password"
                name="otp"

                value={formState.otp}

                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    otp: e.target.value.toString(),
                  }))
                }

                className="input input-bordered w-full"
                placeholder="Enter the OTP"
              />
            </div>




            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Submit Otp
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Verifying...
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
