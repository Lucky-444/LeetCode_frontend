import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react"; // 👀 for eye toggle
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";

const SignupSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(100)
    .nonempty(),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters long" })
    .max(100)
    .nonempty(),
});

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    console.log(data);
    //Backend API call here
    dispatch(registerUser(data));
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-base-200 relative bg-no-repeat bg-center bg-contain"
      style={{
        backgroundImage: "url('/4246648.jpg')", // place 4246648.jpg in /public
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        opacity: 1,
      }}
    >
      {/* overlay to make background faint */}
      <div className="absolute inset-0 bg-base-200/90"></div>

      <div className="card w-full max-w-md shadow-xl bg-base-100 relative z-10">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center mb-4">SpidyLeet</h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* First Name */}
            <div>
              <input
                type="text"
                {...register("firstName", { required: true })}
                placeholder="Enter Your First Name"
                className="input input-bordered w-full"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                {...register("email", { required: true })}
                placeholder="Enter Your Email"
                className="input input-bordered w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: true })}
                placeholder="Enter Your Password"
                className="input input-bordered w-full pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="form-control mt-4">
              <button
                type="submit"
                className={`btn btn-primary w-full${loading ? " loading" : ""}`}
                disabled={loading}
              >
               {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
            <Link
              to="/login"
              className="text-center text-sm  text-underline hover:text-gray-700 "
            >
              Already have an account? Log in
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
