import styles from './SegmentedControl.module.css';

export const SegmentedControl = ({ label, name, color, value, options = [], onChange = value => {}, setterFunction }) => {
    return (
        <div className={styles.segmentedControl}>
            <p style={{ color: color }}>
                {label}
            </p>
            <div className={styles.optionsContainer}>
                { options.map(opt => (
                    <button
                        className={`${styles.option} ${value == opt ? styles.selected : ''}`}
                        key={opt}
                        onClick={() => {
                            setterFunction(prev => {
                                if (value != opt) {
                                    onChange?.(opt);
                                }

                                return ({
                                    ...prev,
                                    [name]: opt
                                });
                            });
                        }}
                    >
                        {opt}
                    </button>
                )) }
            </div>
        </div>
    );
};