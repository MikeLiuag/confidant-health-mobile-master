/**
 * Created by Sana on 5/10/2019.
 */
import { createStyles, maxWidth } from 'react-native-media-queries';

export const commonText = {
    fontFamily: 'Roboto-Regular',
};

const baseTexts = {
    mainTitle: {
        ...commonText,
        maxWidth: '75%',
        marginTop: 10,
        fontSize: 24,
    },
    subTitle: {
        maxWidth: '70%',
        textAlign: 'left',
        fontSize: 14,
        fontFamily: 'OpenSans-Regular',
    },
    largeTitle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 36,
        textAlign: 'center',
        fontWeight: '500',
    },


    // New UI/UX updates
    ManropeExtraBold: {
        fontFamily: 'Manrope-ExtraBold'
    },
    ManropeBold: {
        fontFamily: 'Manrope-Bold'
    },
    ManropeMedium: {
        fontFamily: 'Manrope-Medium'
    },
    ManropeRegular: {
        fontFamily: 'Manrope-Regular'
    },
    ManropeLight: {
        fontFamily: 'Manrope-Light'
    },
    SerifProExtraBold: {
        fontFamily: 'Source-Serif-Pro-Black'
    },
    SerifProBold: {
        fontFamily: 'Source-Serif-Pro-Bold'
    },
    SerifProMedium: {
        fontFamily: 'Source-Serif-Pro-Semi-Bold'
    },
    SerifProRegular: {
        fontFamily: 'Source-Serif-Pro-Regular'
    }
};

export const mediaTexts = createStyles(
    baseTexts,
    // override styles only if screen width is less than 500
    maxWidth(400, {
        mainTitle: {
            maxWidth: '85%',
            marginTop: 10,
            marginBottom: 10,
            fontSize: 18,
        },
        subTitle: {
            maxWidth: '80%',
            fontSize: 12,
            lineHeight: 16,
            marginBottom: 15,
        }
    })
);

