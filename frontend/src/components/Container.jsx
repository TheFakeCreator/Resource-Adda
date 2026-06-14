import { Stack, Alert } from "@mui/material";
import React, { useState } from "react";

export default function AlertCont({}) {

    const [alerts, setAlerts] = useState([])

    return (
        <div>
            <Stack spacing={1}>
                {alerts.map((alert) => {
                    <Alert severity={alert.severity}>{alert.message}</Alert>
                })}
            </Stack>
        </div>
    );
}
