package live.safeopioidusecoalition.confidant.services;

import android.util.Log;

import com.onesignal.NotificationExtenderService;
import com.onesignal.OSNotificationReceivedResult;

public class ConfidantNotificationExtender extends NotificationExtenderService {
    @Override
    protected boolean onNotificationProcessing(OSNotificationReceivedResult notification) {
        Log.d("ONE-SIGNAL-NATIVE", "Got Notification");
        Log.d("ONE-SIGNAL-NATIVE", notification.payload.toString());

        return false;
    }
}
