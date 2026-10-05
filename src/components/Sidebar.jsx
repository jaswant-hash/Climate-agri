import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudIcon from "@mui/icons-material/Cloud";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ScienceIcon from "@mui/icons-material/Science";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";

import "./Sidebar.css";

export default function Sidebar() {

    const menus = [
        {
            icon: <DashboardIcon />,
            title: "Dashboard"
        },
        {
            icon: <CloudIcon />,
            title: "Current Climate"
        },
        {
            icon: <PsychologyIcon />,
            title: "Prediction"
        },
        {
            icon: <ScienceIcon />,
            title: "Simulation"
        },
        {
            icon: <QueryStatsIcon />,
            title: "Explainable AI"
        },
        {
            icon: <HistoryIcon />,
            title: "History"
        },
        {
            icon: <SettingsIcon />,
            title: "Settings"
        }
    ]

    return (

        <aside className="sidebar">

            <div className="logo">

                ☁ WeatherAI

            </div>

            <div className="menu">

                {
                    menus.map((item, index) =>

                        <div
                            key={index}
                            className={`menuItem ${index === 0 ? "active" : ""}`}
                        >

                            {item.icon}

                            <span>{item.title}</span>

                        </div>

                    )
                }

            </div>

        </aside>

    )

}