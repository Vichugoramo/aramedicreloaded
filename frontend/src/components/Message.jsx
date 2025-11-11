import styles from './Message.module.css';

export const Message = ({ content = '', sentBySelf = false }) => {
    return (
        <div className={`${styles.message} ${sentBySelf && styles.sentBySelf}`}>
            <div className={`${styles.messageBubble}`}>
                {content}
            </div>
        </div>
    );
}