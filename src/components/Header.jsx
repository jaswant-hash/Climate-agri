import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";

import "./Header.css";

export default function Header() {

    return (

        <header className="header">

            <div className="searchBox">

                <SearchIcon />

                <input
                    type="text"
                    placeholder="Search city..."
                />

            </div>

            <div className="right">

                <NotificationsIcon className="bell" />

                <div className="profile">

                    <img
                        src="https://i.pravatar.cc/40"
                        alt=""
                    />

                    <div>

                        <h4>Jaswant</h4>

                        <small>Administrator</small>

                    </div>

                </div>

            </div>

        </header>

    )

}