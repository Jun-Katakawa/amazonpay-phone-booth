import React, { useState, memo, FC, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export type U3SnackbarType = {
    severity: AlertColor;
    body: string;
    timestamp: number;
};

type U3SnackbarProps = {
    message: U3SnackbarType | undefined;
};

const U3Snackbar: FC<U3SnackbarProps> = memo((props) => {

    const [ open, setOpen ] = useState<boolean>(false);

    useEffect(() => {
        if (!props.message || "" === props.message.body) {
            return;
        }

        // previousTimestampが同じなら、何もしない
        const previousTimestamp = Number(window.sessionStorage.getItem("previousTimestamp") || 0 );
        if (previousTimestamp === props.message.timestamp) {
            return;
        }

        // previousTimestampを更新
        window.sessionStorage.setItem("previousTimestamp", props.message.timestamp.toString());

        setOpen(true);
        
        // 終了処理
        return () => {
            setOpen(false);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.message?.timestamp]);

    /**
	 * エラーメッセージを閉じるイベントハンドラー
	 * @param event 
	 * @param reason 
	 * @returns 
	 */
	const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};

    return (
        <Snackbar open={open} autoHideDuration={1500} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={props.message?.severity} sx={{ width: '100%' }}>
                {props.message?.body}
            </Alert>
        </Snackbar>
    );
});

export default U3Snackbar;
