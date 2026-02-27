export const Notification = ({ message }) => {
    if (message === null) {
        return null
    }

    return (
        <div className="notification">
            {message}
        </div>
    )
}

export const ErrorNotification = ({ message }) => {
    if (message === null) {
        return null
    }

    return (
        <div className="errorNotification">
            {message}
        </div>
    )
}