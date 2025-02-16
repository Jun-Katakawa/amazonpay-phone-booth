import { FC,  memo, useEffect, useState } from "react";

import { 
    Box,
    Button, 
    Container, 
    Grid, 
    Paper, 
    Stack, 
    styled, 
    ThemeProvider, 
    Typography 
} from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { PhoneBoothItemType } from "shared-types/@types/database";
import { usePhoneBoothMaster } from "../hooks/usePhoneBoothMaster";

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: 60,
    lineHeight: '60px',
}));
  
export const TopPage: FC = memo(() => {
    const [ phoneBoothItems, setPhoneBoothItems ] = useState<PhoneBoothItemType[]>([]);
    const { getAllPhoneBooths } = usePhoneBoothMaster();

    useEffect(() => {
        getCurrentPhoneBooths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getCurrentPhoneBooths = async () => {
        console.log("getCurrentPhoneBooths");
        const phoneBoothItems = await getAllPhoneBooths();
        // phone_booth_idでソート
        phoneBoothItems.sort((a, b) => {
            if (a.phone_booth_id < b.phone_booth_id) return -1;
            if (a.phone_booth_id > b.phone_booth_id) return 1;
            return 0;
        });
        setPhoneBoothItems(phoneBoothItems);
    }

    const convertTimestamp = (timestamp: number | undefined) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    return (
        <Container sx={{ marginBottom: 2 }}>
            <Stack spacing={2}>
                <Typography variant="h2">Phone Booth</Typography>
                <Grid container spacing={2}>
                {phoneBoothItems.map((item: PhoneBoothItemType, index: number) => {
                    return (
                    <Grid item xs={4} key={index}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                display: 'grid',
                                gridTemplateColumns: { md: '1fr 1fr' },
                                gap: 2,
                            }}
                        >
                            <Item 
                                elevation={5}
                                sx={{
                                    gridColumn: { md: '1 / 3' },
                                    height: 240,
                                    borderColor: item.door_status === "close" ? "red" : "green",
                                    borderStyle: "solid",
                                    backgroundColor: item.door_status === "close" ? "pink" : "lightgreen",
                                    
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        height: "100%",
                                    }}
                                >
                                {/* <Stack key={item.phone_booth_id} direction="row" spacing={2}> */}
                                    {/* <Typography>{item.phone_booth_id}</Typography> */}
                                    <Typography variant="h4" sx={{ position: "absolute", left: 10, top: 10 }}>{item.floor} {item.description}</Typography>
                                    {/* <Typography variant="body2" sx={{ position: "absolute", left: 10, top: 50 }}>{item.description}</Typography> */}
                                    <Typography sx={{ position: "absolute", left: 120, top: 76 }}>
                                        {item.door_status === "close" 
                                            ? <LockIcon sx={{ width: 100, height: 100 }} /> 
                                            : <LockOpenIcon sx={{ width: 100, height: 100 }} />}
                                            {/* <br />
                                            {item.door_status} */}
                                    </Typography>
                                    <Typography></Typography>
                                    <Typography variant="body2" sx={{ position: "absolute", right: 10, bottom: 10 }}>Update: {convertTimestamp(item.update_timestamp)}</Typography>
                                {/* </Stack> */}
                                </Box>
                            </Item>
                        </Box>
                    </Grid>
                    );
                })}
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    // startIcon={<ShoppingCartIcon />}
                    onClick={() => getCurrentPhoneBooths()}
                >
                    Refresh
                </Button>
            </Stack>
        </Container>
    );
});