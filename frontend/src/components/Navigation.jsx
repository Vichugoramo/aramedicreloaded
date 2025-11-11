import styles from './Navigation.module.css';
import AssistanceIcon from '../assets/ion--medical.svg?react';
import PatientIcon from '../assets/material-symbols--medical-mask.svg?react';
import ChatIcon from '../assets/mynaui--message-solid.svg?react';
import ProfileIcon from '../assets/iconamoon--profile-fill.svg?react';
import ClinicianIcon from '../assets/maki--doctor.svg?react';
import { NavigationItem } from './NavigationItem';
import { useToken } from '../contexts/TokenContext';

const clinicianItems = [
	{
		label: 'Asistencia',
		path: 'assistance',
		IconComponent: AssistanceIcon
	},
	{
		label: 'Paciente',
		path: 'counterpart',
		IconComponent: PatientIcon
	},
	{
		label: 'Chat',
		path: 'chat',
		IconComponent: ChatIcon
	},
	{
		label: 'Perfil',
		path: 'profile',
		IconComponent: ProfileIcon
	}
];

const patientItems = [
	{
		label: 'Asistencia',
		path: 'assistance',
		IconComponent: AssistanceIcon
	},
	{
		label: 'Médico',
		path: 'counterpart',
		IconComponent: ClinicianIcon
	},
	{
		label: 'Chat',
		path: 'chat',
		IconComponent: ChatIcon
	},
	{
		label: 'Perfil',
		path: 'profile',
		IconComponent: ProfileIcon
	}
];

export const Navigation = () => {
	const userType = useToken().tokenData?.type;
	const items = userType == 'MEDICO' ? clinicianItems : patientItems;

	return (
		<div className={styles.navigation}>
			{ items.map(item => (
				<NavigationItem
					key={item.label}
					label={item.label}
					path={item.path}
					IconComponent={item.IconComponent}
				/>
			)) }
		</div>
	);
}