import { BrowserRouter, Routes, Route } from "react-router";
import { IndexPage } from "./routes/IndexPage";
import { LoginPage } from "./routes/LoginPage";
import { ClinicianSignUpPage } from "./routes/ClinicianSignUpPage";
import { PatientSignUpPage } from "./routes/PatientSignUpPage";
import { Layout } from "./routes/Layout";
import { AssistancePage } from "./routes/AssistancePage";
import { CounterpartPage } from './routes/CounterpartPage';
import { ChatPage } from './routes/ChatPage';
import { ProfilePage } from './routes/ProfilePage';
import { SettingsPage } from "./routes/SettingsPage";
import { APIProvider } from './contexts/APIContext';
import { TokenProvider } from "./contexts/TokenContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { EmergencyTypesProvider } from "./contexts/EmergencyTypesContext";
import { AssistanceServiceProvider } from './contexts/AssistanceServiceContext';
import { LocationProvider } from "./contexts/LocationContext";

export const App = () => {
    return (
		<BrowserRouter>
			<LocationProvider>
				<TokenProvider>
					<APIProvider>
						<AssistanceServiceProvider>
							<ProfileProvider>
								<EmergencyTypesProvider>
									<Routes>
										<Route index element={<IndexPage />} />
										<Route path="login" element={<LoginPage />} />
										<Route path="signup-clinician" element={<ClinicianSignUpPage />} />
										<Route path="signup-patient" element={<PatientSignUpPage />} />
										<Route path="app-settings" element={<SettingsPage />} />
										<Route path="navigation" element={<Layout />}>
											<Route index element={<AssistancePage />} />
											<Route path="assistance" element={<AssistancePage />} />
											<Route path="counterpart" element={<CounterpartPage />} />
											<Route path="chat" element={<ChatPage />} />
											<Route path="profile" element={<ProfilePage />} />
										</Route>
									</Routes>
								</EmergencyTypesProvider>
							</ProfileProvider>
						</AssistanceServiceProvider>
					</APIProvider>
				</TokenProvider>
			</LocationProvider>
		</BrowserRouter>		
    );
};