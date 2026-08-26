import React, { useContext, Suspense } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { getPrivateGuestPath } from "../utils/publicSitePaths";

const Route = ({ component: Component, isPrivate = false, guestRedirect, ...rest }) => {
	const { isAuth, loading } = useContext(AuthContext);

	return (
		<RouterRoute
			{...rest}
			render={(props) => {
				if (!isAuth && isPrivate) {
					return (
						<>
							{loading && <BackdropLoading />}
							<Redirect to={{ pathname: getPrivateGuestPath(guestRedirect), state: { from: props.location } }} />
						</>
					);
				}

				if (isAuth && !isPrivate) {
					return (
						<>
							{loading && <BackdropLoading />}
							<Redirect to={{ pathname: "/", state: { from: props.location } }} />
						</>
					);
				}

				return (
					<>
						{loading && <BackdropLoading />}
						<Suspense fallback={<BackdropLoading />}>
							<Component {...props} />
						</Suspense>
					</>
				);
			}}
		/>
	);
};

export default Route;
