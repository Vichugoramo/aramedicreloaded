import GeneralIcon from '../assets/fa6-solid--user-doctor.svg?react';
import NurseIcon from '../assets/mingcute--nurse-fill.svg?react';
import PediatricianIcon from '../assets/mdi--kids-room.svg?react';
import GeriatricianIcon from '../assets/material-symbols--elderly-rounded.svg?react';
import PhysioIcon from '../assets/material-symbols--physical-therapy.svg?react';

const icons = [
    {
        speciality: 'medico general',
        IconComponent: GeneralIcon
    },
    {
        speciality: 'enfermero',
        IconComponent: NurseIcon
    },
    {
        speciality: 'pediatra',
        IconComponent: PediatricianIcon
    },
    {
        speciality: 'geriatra',
        IconComponent: GeriatricianIcon
    },
    {
        speciality: 'fisioterapeuta',
        IconComponent: PhysioIcon
    }
]

export const SpecialityIcon = ({ speciality }) => {
    const iconObj = icons.find(icon => icon.speciality == speciality);

    if (!iconObj) {
        console.error(`SpecialityIcon: No icon found for speciality '${speciality}', using default`);
    }

    const { IconComponent } = iconObj || icons[0];

    return <IconComponent />;
}