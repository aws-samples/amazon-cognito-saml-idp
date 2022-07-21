// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect } from "react";
import { Auth } from "aws-amplify";
import config from '../config';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { makeStyles } from "@mui/styles";

import Link from "@mui/material/Link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { NavLink } from "react-router-dom";
import { isLocalhost, isSuperadminOrDev, parseGroups } from '../utils/helper'

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
        '& > *': {
            marginLeft: '25px',
            marginRight: '25px',
        }
    },
    navLinksContainers: {
        flexGrow: 1,
        marginLeft: "2em",
        textAlign: "right",
        "& > *": {
            marginLeft: "4em",
            fontSize: "1.2em",
            fontWeight: "bold",
            color: "#fff",
            textDecoration: "none",
        },
    },
}));

function Header(props) {
    const classes = useStyles(props);
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    const [userGroups, setUserGroups] = React.useState([]);
    const {type, height} = props;

    useEffect(() => {
        getUserInfo()
    }, []);

    const getUserInfo = async () => {
        try {
            // bypassCache: Optional, By default is false. 
            // If set to true, this call will send a request to Cognito to get the latest user data. Without this you may experience old user data
            const user =  await Auth.currentAuthenticatedUser({bypassCache: true});
            if (user) {
                console.log("user: ", user.attributes)
                const groups = user.attributes[config.cognito.SUPERADMIN_GROUP_KEY] || ""
                const parsedGroups = parseGroups(groups)
                setUserGroups(parsedGroups);
            }
        } catch (e) {
          if (e !== 'The user is not authenticated') {
            console.warn(e);
          }
        }
    };

    const links = () => {
        return (
            <div className={classes.navLinksContainers}>
                <NavLink to="/">
                    Home
                </NavLink>
                { (isSuperadminOrDev(userGroups)) && (
                    <NavLink to="/items">
                        Items
                    </NavLink>
                )}
                <NavLink to="/login" onClick={signOut}>
                    Logout
                </NavLink>
            </div>
        )
    }

    return (
        <>
            <AppBar position="static" style={{ background: '#39454e' }}>
                <Toolbar className={classes.toolbar}>
                    { authStatus === 'authenticated' ? links() : null }
                </Toolbar>
            </AppBar>
        </>
    );
}

export default Header;
