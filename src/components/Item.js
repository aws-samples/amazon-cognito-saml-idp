// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from "react";
import { useParams } from 'react-router-dom';

function Item() {
  const params = useParams();
  return (
    <>
      <h2>Item component</h2>
      <h4>This is item {params.itemId}</h4>
    </>
  )
}

export default Item;
