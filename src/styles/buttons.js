/**
 * Created by Sana on 5/10/2019.
 */
import { createStyles, maxWidth } from 'react-native-media-queries';


const baseButtons = {
    roundBtn: {
        width: 138,
        height: 138,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
        borderColor: 'transparent',
        elevation: 0,
        fontFamily: 'Roboto-Regular',
    },
    roundIcon: {
        width: 35,
        height: 35,
        marginBottom: 10,
    },
    roundText: {
        fontSize: 14,
        textAlign: 'center',
        width: 100,
        marginTop: 3
    },
    prevNextText: {
        fontSize: 13,
        paddingLeft: 25,
        paddingRight: 25,
        fontFamily: 'Roboto-Regular',
    },
    startButtonBG: {
        width:'100%',
        height: 50,
        marginTop: 10,
        justifyContent: 'center',
        borderRadius: 3,
    },
};

export const mediaButtons = createStyles(
    baseButtons,
    // override styles only if screen width is less than 500
    maxWidth(400, {
        roundBtn: {
            width: 120,
            height: 120,
        },
        roundIcon: {
            width: 30,
            height: 30,
        },
        roundText: {
            fontSize: 13,
            width: 85,
            paddingLeft: 0,
            paddingRight: 0,
        },
        prevNextText: {
            fontSize: 15,
            paddingLeft: 20,
            paddingRight: 20,
        }
    })
);
