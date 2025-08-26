import { useState } from "react";
import { useForm } from 'react-hook-form';


const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen flex flex-col gap-4 justify-center items-center">
      <input type="text" {...register("FirstName", { required: true })} placeholder="Enter Your First Name" />
      {errors.FirstName && <span>This field is required</span>}

      <input type="email" {...register("email", { required: true })} placeholder="Enter Your Email" />
      {errors.email && <span>This field is required</span>}

      <input type="password" {...register("password", { required: true })} placeholder="Enter Your Password" />
      {errors.password && <span>This field is required</span>}

      <button type="submit" className="btn">SUBMIT</button>
    </form>
  );
};

export default Signup;

//   const [password, setPassword] = useState("");
//   function handleSubmit(e) {
//     e.preventDefault();
//     // first Validate user input
//     if (!name || !email || !password) {
//       alert("All fields are required");
//       return;
//     }

//     console.log(name, email, password);

//     // Handle signup logic here
//     //Backend API call here
//   }
//   return (

//     <form onSubmit={handleSubmit} className="min-h-screen flex flex-col gap-4 justify-center items-center">

//       <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Your First Name" />
//       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" />
//       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Your Password" />
//       <button type="submit">SUBMIT</button>
//     </form>
//   );
// };

// export default Signup;
