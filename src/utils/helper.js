// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import config from '../config.js';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const isSuperadminOrDev = (userGroups) => {
  return userGroups.includes(config.cognito.SUPERADMIN_GROUP_NAME) 
}

const parseGroups = (text) => {
  return text.match(/\w+/g)
}

export { isLocalhost, isSuperadminOrDev, parseGroups };