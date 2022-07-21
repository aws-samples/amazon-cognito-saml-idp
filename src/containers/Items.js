// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from "react"
import { Auth } from 'aws-amplify';
import { useNavigate, Link } from "react-router-dom";
import config from '../config.js';
import { isSuperadminOrDev, parseGroups } from '../utils/helper'

const ITEMS = [
  {
    name: "Item 1",
    id: "1",
    description: "Item 1 description"
  },
  {
    name: "Item 2",
    id: "2",
    description: "Item 2 description"
  },
]

function Items() {
  let navigate = useNavigate();

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    // bypassCache: Optional, By default is false. 
    // If set to true, this call will send a request to Cognito to get the latest user data. Without this you may experience old user data
    const user =  await Auth.currentAuthenticatedUser({bypassCache: true})
      .then((user) => {
        const groups = user.attributes[config.cognito.SUPERADMIN_GROUP_KEY] || ""
        const parsedGroups = parseGroups(groups)
        if(!isSuperadminOrDev(parsedGroups)) {
          navigate("/", { replace: true})
        }
      })
      .catch((error) => console.log("Issue fetching authenticated user: ", error));
  };

  return (
    <div className="Items">
      <h2>This is the Items container</h2>
      <header className="App-header">
        <p>
          Edit <code>src/containers/Items.js</code> and save to reload.
        </p>
        { ITEMS.map((item) => {
          return <Link key={item.id} to={item.id} style={{color: '#307cff', textDecoration: 'none', hover: 'pointer'}}>{item.name}</Link>
        })}
      </header>
    </div>
  );
}

export default Items;
