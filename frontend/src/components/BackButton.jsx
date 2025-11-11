import styles from './BackButton.module.css';
import { useNavigate } from 'react-router';
import Arrow from '../assets/material-symbols--arrow-back-rounded.svg?react';

export const BackButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(-1);
    }

    return (
        <button className={styles.backButton} onClick={handleClick}>
            <Arrow />
        </button>
    );
};