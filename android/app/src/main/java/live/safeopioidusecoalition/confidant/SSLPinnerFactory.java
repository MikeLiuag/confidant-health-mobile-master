package live.safeopioidusecoalition.confidant;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.ReactCookieJarContainer;
import okhttp3.CertificatePinner;
import okhttp3.OkHttpClient;

import java.util.concurrent.TimeUnit;

public class SSLPinnerFactory implements OkHttpClientFactory {

    public OkHttpClient createNewNetworkModuleClient() {
        CertificatePinner certificatePinner = new CertificatePinner.Builder()
                .add("app.confidanthealth.com", "sha256/8wAPhbcUi4m3jNUdcNTliKSU+r8Hrvbq81Fe8whkXg=")
                .add("app.confidanthealth.com", "sha256/8Rw90Ej3Ttt8RRkrg+WYDS9n7IS03bk5bjP/UXPtaY8=")
                .add("app.confidanthealth.com", "sha256/Ko8tivDrEjiY90yGasP6ZpBU4jwXvHqVvQI0GS3GNdA=")
                .add("app.confidanthealth.com", "sha256/VjLZe/p3W/PJnd6lL8JVNBCGQBZynFLdZSTIqcO0SJ8=")
                .add("qa.confidantdemos.com", "sha256/7jtYHsUyjosdUK0I8J7J1356WcHn6nsrHKkRhB3IXwI=")
                .add("qa.confidantdemos.com", "sha256/jQJTbIh0grw0/1TkHSumWb+Fs0Ggogr621gT3PvPKG0=")
                .add("qa.confidantdemos.com", "sha256/AV3JtTXopW86Wtx4zo8xxfead+Dg3iMiHi5Uccnk6wQ=")
                .add("staging.confidantdemos.com", "sha256/C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=")
                .add("staging.confidantdemos.com", "sha256/jQJTbIh0grw0/1TkHSumWb+Fs0Ggogr621gT3PvPKG0=")
                .add("staging.confidantdemos.com", "sha256/ZWDKKmC1gpYhVPxUIz/idL9POXUQNCd0/DO3GMQllD0=")
                .add("dev.confidantdemos.com", "sha256/C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=")
                .add("dev.confidantdemos.com", "sha256/jQJTbIh0grw0/1TkHSumWb+Fs0Ggogr621gT3PvPKG0=")
                .add("dev.confidantdemos.com", "sha256/DJ/3U9ynFeiSE8EfzFfiYtrsInQhGoOgcPVNOIoAOKg=")
                .build();

    OkHttpClient.Builder client = new OkHttpClient.Builder()
      .connectTimeout(0, TimeUnit.MILLISECONDS)
      .readTimeout(0, TimeUnit.MILLISECONDS)
      .writeTimeout(0, TimeUnit.MILLISECONDS)
      .cookieJar(new ReactCookieJarContainer())
      .certificatePinner(certificatePinner);

    return OkHttpClientProvider.enableTls12OnPreLollipop(client).build();
    }
}
