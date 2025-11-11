import styles from './Select.module.css';
import { useEffect } from 'react';

export const Select = ({ label, name, color, value, options = [], onChange, setterFunction }) => {

    useEffect(() => {
        if (!name) {
            console.log(`WARNING: No name was provided for select with label '${label}'`);
        }

    }, [name]);

    useEffect(() => {
        if (options.length == 0) {
            console.log(`WARNING: No options were provided for select with label '${label}'`);
        }

    }, [options]);

    const updateValue = (name, value) => {
        setterFunction(prev => ({
            ...prev,
            [name]: value
        }));
    }

    useEffect(() => {
        updateValue(name, options[0]);
    }, []);

    return (
        <label className={styles.select}>
            <p style={{ color: color }}>
                {label}
            </p>
            <select
                className={styles.htmlSelect}
                value={value}
                name={name}
                onChange={(e) => {
                    const {name, value} = e.target;
                    updateValue(name, value);
                    onChange?.(e);
                }}
            >
                { options.map(opt => (
                    <option key={opt}>{opt}</option>
                )) }
            </select>
        </label>
    );
};