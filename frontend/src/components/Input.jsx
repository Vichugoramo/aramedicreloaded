import styles from './Input.module.css';
import { useEffect } from 'react';

export const Input = ({ label, name, type = 'text', color, value, onChange, setterFunction }) => {

    useEffect(() => {
        if (!name) {
            console.log(`WARNING: No name was provided for input with label '${label}'`);
        }

    }, [name]);

    return (
        <label className={styles.input}>
            <p style={{ color: color }}>
                {label}
            </p>
            { type == 'textarea' ? (
                <textarea
                    className={`${styles.htmlInput} ${styles.textarea}`}
                    type={type}
                    value={value}
                    name={name}
                    onChange={(e) => {
                        const {name, value} = e.target;
                        setterFunction(prev => ({
                            ...prev,
                            [name]: value
                        }));
                        onChange?.(e);
                    }}
                />
            ) : (
                <input
                    className={styles.htmlInput}
                    type={type}
                    value={value}
                    name={name}
                    onChange={(e) => {
                        const {name, value} = e.target;
                        setterFunction(prev => ({
                            ...prev,
                            [name]: value
                        }));
                        onChange?.(e);
                    }}
                />
            )}
        </label>
    );
};