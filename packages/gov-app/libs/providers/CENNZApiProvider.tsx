import type { PropsWithChildren } from "@gov-app/libs/types";

import { FC, createContext, useState, useEffect, useContext } from "react";
import { Api } from "@cennznet/api";

interface CENNZApiContextType {
	api: Api;
}

const CENNZApiContext = createContext<CENNZApiContextType>(null);

interface CENNZApiProviderProps extends PropsWithChildren {
	endpoint: string;
}

export const CENNZApiProvider: FC<CENNZApiProviderProps> = ({
	children,
	endpoint,
}) => {
	const [api, setApi] = useState<Api>(null);

	useEffect(() => {
		const initApi = () => {
			const instance = new Api({
				provider: endpoint,
			});

			instance.isReady.then(() => {
				setApi(instance);
				window.onunload = () => instance.disconnect();
			});

			return instance;
		};

		const api = initApi();

		return () => {
			if (api.isConnected) void api.disconnect();
		};
	}, [endpoint]);

	return (
		<CENNZApiContext.Provider value={{ api }}>
			{children}
		</CENNZApiContext.Provider>
	);
};

export function useCENNZApi(): CENNZApiContextType {
	return useContext(CENNZApiContext);
}
