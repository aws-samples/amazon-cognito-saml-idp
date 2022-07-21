// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { createTheme } from '@mui/material/styles';

//@link https://cimdalli.github.io/mui-theme-generator/
const defaultTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#39454e',
            contrastText: '#fff'
        },
        secondary: {
            main: '#454545',
            contrastText: '#fff'
        },
        background: {
            default: '#fff',
        },
        divider: 'rgba(255,255,255,.3)'
    },
    typography: {
        fontFamily: 'AmazonEmber',
        htmlFontSize: 16,
        h1: {
            fontFamily: 'AmazonEmberHeavy',
            fontWeight: 700
        },
        h2: {
            fontFamily: 'AmazonEmberHeavy',
            fontWeight: 700
        },
        h3: {
            fontFamily: 'AmazonEmberBold',
            fontWeight: 700
        },
        h4: {
            fontFamily: 'AmazonEmberBold',
            fontWeight: 700
        },
        h5: {
            fontFamily: 'AmazonEmberMedium',
            fontWeight: 700
        },
        h6: {
            fontFamily: 'AmazonEmberMedium',
            fontWeight: 700
        }
    },
    shape: {
        borderRadius: 0
    },
    shadows: new Array(25).fill('none'),
    prototype: {
        logoHeight: 25,
    }
});

defaultTheme.overrides = {
    MuiButton: {
        root: {
            textTransform: 'none',
        },
        containedPrimary: {
            '&:hover': {
                backgroundColor: defaultTheme.palette.primary.dark,
                color: defaultTheme.palette.primary.main,
            },
        },
        containedSizeLarge: {
            fontWeight: 700,
            fontSize: defaultTheme.typography.h6.fontSize,
        }
    },
    MuiButtonGroup: {
        root: {
        },
        groupedContainedVertical: {
            '&:not(:last-child)': {
                borderBottom: 'none',
            },
        },
        containedSizeLarge: {
            fontWeight: 700,
            fontSize: defaultTheme.typography.h5.fontSize
        }
    },
    MuiLinearProgress: {
        root: {
            minWidth: 420,
            maxWidth: 420
        }
    },
    MuiAvatar: {
        colorDefault: {
            backgroundColor: defaultTheme.palette.primary.main
        }
    },
    MuiPaper: {
        root: {
            backgroundColor: '#39454e'
        }
    }
};

export default defaultTheme;