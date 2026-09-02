import React, { useContext, Suspense } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { isNativeCapacitor } from "../utils/nativeApp";
import { getPrivateGuestPath } from "../utils/publicSitePaths";

const Route = ({ component: Component, isPrivate = false, guestRedirect, ...rest }) => {
	const { isAuth, loading, user } = useContext(AuthContext);

	return (
		<RouterRoute
			{...rest}
			render={(props) => {
				if (loading) {
					return <BackdropLoading />;
				}

				if (!isAuth && isPrivate) {
					return (
						<Redirect
							to={{
								pathname: getPrivateGuestPath(guestRedirect, {
									isNative: isNativeCapacitor(),
								}),
								state: { from: props.location },
							}}
						/>
					);
				}

				if (isAuth && user?.billingOnly && props.location.pathname !== "/financeiro") {
					return (
						<Redirect
							to={{ pathname: "/financeiro", state: { from: props.location } }}
						/>
					);
				}

				if (isAuth && !isPrivate) {
					return (
						<Redirect
							to={{
								pathname: user?.billingOnly ? "/financeiro" : "/",
								state: { from: props.location },
							}}
						/>
					);
				}

				return (
					<Suspense fallback={<BackdropLoading />}>
						<Component {...props} />
					</Suspense>
				);
			}}
		/>
	);
};

export default Route;
