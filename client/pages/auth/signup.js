import { useState } from "react";
import { useAuth } from "../../context/contextApi";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setCurrentUser } = useAuth();

  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: { email, password },
    onSuccess: (user) => {
      setCurrentUser(user);
      Router.push("/");
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  return (
    <div className="card p-4 shadow-sm">
      <h2 className="text-center mb-3">Sign Up</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errors}
        <button className="btn btn-primary w-100">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
