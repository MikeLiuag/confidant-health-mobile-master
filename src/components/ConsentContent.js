import React from 'react';
import { Image, Dimensions, StyleSheet, Linking} from 'react-native';
import {
    Content,
    View,
    Text
} from 'native-base';
import {Colors, FloatingInputField, PrimaryButton, TextStyles} from "ch-mobile-shared";

export class ConsentContent extends React.PureComponent {

    render() {
        return(
            <View style={{marginTop:24,marginBottom:24}}>
                <Text style={styles.consentModalTitle}>PATIENT INFORMED CONSENT</Text>

                <Text style={styles.consentModalPara}>
                    Confidant Health, LLC and its affiliated professional entities (collectively “Confidant”), and Confidant’s physicians, nurse practitioners, physician assistants,
                    and other healthcare professionals (each, a “Provider”), may provide you with behavioral health care services through asynchronous or synchronous telehealth technology
                    (the “Services”). If you have questions about the Services and whether they are appropriate for you, the risks associated with receiving the Services
                    (including receiving Services via telehealth), or your Provider’s credentials and professional background, please ask your Provider.
                    In exchange for receiving the Services, you acknowledge and agree to the following terms and conditions of this informed consent (this “Consent”):
                </Text>

                <Text style={styles.consentModalTitle}>
                    1.	Receiving Services Generally. You understand and agree that:
                </Text>

                <Text style={styles.consentModalPara}>
                    ●	The Provider will decide, in his or her sole discretion, whether the Services are appropriate to treat your condition.
                </Text>
                <Text style={styles.consentModalPara}>
                    ●	If you are a parent or legal guardian of a minor that is seeking to receive Services, you agree that (1) you are providing this Consent on behalf of your minor child, and (2) you will verify your identity before any services are delivered to your minor child.
                </Text>
                <Text style={styles.consentModalPara}>
                    ●	Your Provider will protect the privacy and security of any personal health information transmitted in accordance with federal, state, and other applicable law.
                </Text>
                <Text style={styles.consentModalPara}>
                    ●	You have the right to request copies of your medical records, which may be provided electronically or in hard copy format at reasonable cost of preparation, shipping and delivery.
                </Text>
                <Text style={styles.consentModalPara}>
                    ●	No warranty or guarantee has been made to you concerning any particular result related to your condition or diagnosis.
                </Text>

                <Text style={styles.consentModalTitle}>
                    2.	Telehealth Specific Considerations.
                </Text>

                <Text style={styles.consentModalPara}>
                    a.	Receiving Services via Telehealth. You understand and agree that:
                </Text>

                <Text style={styles.consentModalPara}>
                    ●	IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, YOU SHOULD DIAL “911” IMMEDIATELY. Services provided to you by Confidant Providers not for medical emergencies, and Confidant is not able to connect you directly to any local emergency services via telehealth technology.
                </Text>
                <Text style={styles.consentModalPara}>
                    ●	The Provider will decide, in his or her sole discretion, whether it is appropriate to treat your condition via telehealth. The Provider may request that you stop receiving such Services and instead receive in-person care.
                </Text>
                <Text style={styles.consentModalPara}>
                    ●	Services may involve electronic communication of your personal medical information to Providers that may be located in other areas, including out of state.
                </Text>
                <Text style={styles.consentModalPara}>
                    ●	The anticipated response time for electronic communications submitted through the telehealth varies and you accept any risk associated with the response time, including a delay in obtaining care.
                </Text>
                <Text style={styles.consentModalPara}>
                    b.	Benefits Associated with Telehealth. You understand that receiving Services from a Provider is a complement to—not a replacement of—any in-person care or
                    the care of from any other healthcare provider. Although results are not guaranteed, receiving the Services may, but are not guaranteed, to have benefits associated with them, such as:
                </Text>

                <Text style={styles.consentModalPara}>
                    (i) it may be easier and more efficient for you to access medical care and treatment that are not available in your immediate geographic area;
                </Text>
                <Text style={styles.consentModalPara}>
                    (ii) you may obtain medical care and treatment at times that are convenient for you;
                </Text>
                <Text style={styles.consentModalPara}>
                    (iii) you may interact with Providers without the necessity of an in-person appointment;
                </Text>
                <Text style={styles.consentModalPara}>
                    (iv) you may avoid travel and transportation difficulties; and
                </Text>
                <Text style={styles.consentModalPara}>
                    (v) telehealth services minimize the amount of time necessary to attend a healthcare appointment.
                </Text>

                <Text style={styles.consentModalPara}>
                    c.	Risks Associated with Telehealth. You understand that receiving the Services may have risks associated with them, such as
                </Text>

                <Text style={styles.consentModalPara}>
                    (1) information that you transmit through telehealth technology may be insufficient to allow for appropriate decision-making by the Provider;
                </Text>

                <Text style={styles.consentModalPara}>
                    (2) failures of equipment (e.g., servers, devices, dropped telephone calls, technical failure, unclear video, loss of sound, poor connection, loss of connection, interruptions) or infrastructure (e.g., communications lines, power supply, software failures) may cause interruptions and delays in the provision of care and treatment, or loss of information;
                </Text>
                <Text style={styles.consentModalPara}>
                    (3) the inability of a Provider to conduct certain tests or access complete medical records may in some cases prevent the Provider from providing a diagnosis or treatment, or from identifying the need for emergency medical care or treatment for you;

                    (4) given regulatory requirements in certain jurisdictions, a Provider’s treatment options, including pertaining to certain prescriptions, may be limited; and

                    (5) in rare events, security protocols could fail, causing unauthorized access to your health information.

                    You acknowledge that, although Confidant strives to prevent unauthorized access to information about you various security measures, Confidant cannot guarantee that your use of telehealth technology to receive Services and the information will be private or secure, and you consent to this risk.
                    You acknowledge that it is your responsibility to ensure that your physical location during any Services provided via telehealth with your Provider is free of other people to ensure your confidentiality.
                    To protect your cyber security, you should access all videoconference sessions using a secured Wi-Fi network, if one is available to you.
                </Text>
                <Text style={styles.consentModalPara}>
                    3.	Group Therapy. If you and a Provider decide to engage in group or couples therapy or any other group wellness or health offerings (collectively “Group Therapy”), you understand that information discussed in Group Therapy is for therapeutic purposes and is not intended for use in any legal proceedings involving Group Therapy participants.
                    You agree not to subpoena the Provider to testify for or against other Group Therapy participants or provide records in court actions against other Group Therapy participants.
                    You understand that anything any Group Therapy participant tells the Provider individually, whether on the phone or otherwise, may at the therapist’s discretion be shared with
                    the other Group Therapy participants. You agree to share responsibility with the Provider for the therapy process, including goal setting and termination.
                </Text>

                <Text style={styles.consentModalPara}>
                    4.	Confidentiality. All interactions with Services, including scheduling, attendance at appointments, content of your sessions, progress made, and your records,
                    are confidential. You understand and agree that Confidant or a Provider may share your personal health information in accordance with our Notice of Privacy
                    Practices or unless otherwise prohibited by applicable law.
                </Text>

                <Text style={styles.consentModalPara}>
                    5.	Accuracy of Information Submitted to the Provider. You acknowledge and agree that you are solely responsible for ensuring that the information submitted by you is accurate, complete and current at all times when you receive Services.
                    You understand that the Provider will rely on this information to provide services to you.
                </Text>

                <Text style={styles.consentModalPara}>
                    6.	Notice of Privacy Practices and Sharing of Information. You acknowledge by signing this consent form that you have received, or have declined to receive, Confidant’s Notice of Privacy Practices, and understand that you can access Confidant’s Notice of Privacy Practices at any time via the Patient Portal or can request a copy from your Provider.
                </Text>

                <Text style={styles.consentModalPara}>
                    7.	Other State Requirements. If you have any concerns about the quality of care you are receiving please speak with your Provider to consider how your concerns can be addressed. Any discussion will be taken seriously and handled with care and respect. You may also request a referral to another Provider. To understand other state specific rights you have as a patient, please carefully review the state-specific notices on Attachment A.
                </Text>

                <Text style={styles.consentModalPara}>
                    8.	Release and Waiver. You acknowledge and agree to limit, disclaim, and release Confidant from liability in connection with your use of telehealth technology to receive the Services.
                </Text>

                <Text style={styles.consentModalPara}>
                    9.	Expenses. You understand and agree that you may be responsible for the cost of certain professional fees associated with your use of telehealth technology to receive the Services and the cost of any medications or supplies prescribed by the Provider, if applicable.
                </Text>

                <Text style={styles.consentModalPara}>
                    10.	Other Legal Terms. This Consent cannot be amended except in writing by mutual agreement of Confidant and you. If any provision is or becomes unenforceable or invalid, the other provisions will continue with the same effect.
                </Text>
                <Text style={styles.consentModalPara}>
                    11.	Right to Revoke. You have the right to withhold or withdraw your consent to receive the Services in the course of your care at any time. You may suspend or terminate access to the services at any time for any reason or for no reason in accordance with this Section 11. You understand that you can revoke this Consent by sending written notice using electronic mail to Confidant at: admin@confidanthealth.com (“Revocation”). You agree that your Revocation must contain your name and your address. You also understand that your Revocation means that you are not permitted to receive Services. Your Revocation will be effective upon Confidant’s receipt of your written notice, except that your Revocation will not have any effect on any action taken by the Provider in reliance on this Consent before Confidant received your written notice of Revocation.
                </Text>

                <Text style={styles.consentModalParCapital}>
                    BY CHECKING THE BOX IN THE CONFIDANT APPLICATION, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTAND AND CONSENT TO ALL OF THE TERMS OF THIS CONSENT. IF A PARENT OR LEGAL GUARDIAN, BY CHECKING THE BOX IN THE CONFIDANT APPLICATION, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTAND AND CONSENT TO ALL OF THE TERMS OF THIS CONSENT ON BEHALF OF THE MINOR PATIENT.
                </Text>

                <Text style={styles.consentSectionB}>
                    ATTACHMENT B
                </Text>

                <Text style={styles.consentModalTitle}>
                    Additional State-Specific Consents
                </Text>

                <Text style={styles.consentModalPara}>
                    The following consents apply to users receiving Services via telehealth as required by the states listed below:
                </Text>

                <Text style={styles.consentModalPara}>
                    •	Alaska: I understand that if I have a primary care provider, that my primary care provider may obtain a copy of my records of my Services. (Alaska Stat. § 08.64.364).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Arizona: I understand I am entitled to all existing confidentiality protections pursuant to A.R.S. § 12-2292. I also understand all medical reports resulting from the telehealth services are part of my medical record as defined in A.R.S. § 12-2291. I also understand dissemination of any images or information identifiable to me for research or educational purposes shall not occur without my consent, unless authorized by state or federal law. (Ariz. Rev. Stat. Ann. § 36-3602).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Connecticut: I understand that if I have primary care provider, that my primary care provider may obtain a copy of my records of my telehealth services with Confidant. (Conn. Gen. Stat. Ann. § 19a-906).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	District of Columbia: I have been informed of alternate forms of communication between me and a Provider for urgent matters. (D.C. Mun. Regs. tit. 17, § 4618.10).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Georgia: I have been given clear, appropriate, accurate instructions on follow-up in the event of needed emergent care related to the telehealth services. (Ga. Comp. R. & Regs. 360-3-.07(7)).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Iowa: I have been informed that if I want to register a formal complaint about a provider, I should visit the medical board’s website, here: {"\n"}
                    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://medicalboard.iowa.gov/consumers/filing-complaint')}>https://medicalboard.iowa.gov/consumers/filing-complaint</Text>
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Idaho: I have been informed that if I want to register a formal complaint about a provider, I should visit the medical board’s website, here: {"\n"}
                    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://bom.idaho.gov/BOMPortal/AgencyAdditional.aspx?Agency=425&AgencyLinkID=650')}>https://bom.idaho.gov/BOMPortal/AgencyAdditional.aspx?Agency=425&AgencyLinkID=650</Text>
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Indiana: I have been informed that if I want to register a formal complaint about a provider, I should visit the medical board’s website, here:{"\n"}
                    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://www.in.gov/attorneygeneral/2434.htm')}>https://www.in.gov/attorneygeneral/2434.htm</Text>
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Kansas: I understand that if I have a primary care provider or other treating physician, the Provider providing Services must send within three business days a report to such primary care or other treating physician of the treatment and services rendered to me during the telehealth services. (Kan. Stat. Ann. § 40-2,212(2)(d)(1)(A)).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Kentucky: I have been informed that if I want to register a formal complaint about a provider, I should visit the medical board’s website, here: {"\n"}
                    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://kbml.ky.gov/grievances/Pages/default.aspx')}>https://kbml.ky.gov/grievances/Pages/default.aspx</Text>
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Maine: I have been informed that if I want to register a formal complaint about a provider, I should visit the medical board’s website, here: {"\n"}
                    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://www.maine.gov/md/discipline/file-complaint.html')}>https://www.maine.gov/md/discipline/file-complaint.html</Text>
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Michigan: I have been informed that if I want to register a formal complaint about a provider, I should contact the State of Michigan’s Department of Licensing and Regulatory Affairs at 611 W. Ottawa, P.O. Box 30004, Lansing, MI 48909 or call 517-335-9700.
                </Text>
                <Text style={styles.consentModalPara}>
                    •	New Hampshire: I understand that the Provider may forward my medical records to my primary care or treating provider. (N.H. Rev. Stat. § 329:1-d).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	New Jersey: I understand I have the right to request a copy of my medical information and I understand my medical information may be forwarded directly to my primary care provider or health care provider of record, or upon my request, to other health care providers. (N.J. Rev. Stat. Ann. § 45:1-62).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Oklahoma: I have been informed that if I want to register a formal complaint about a provider, I should visit the medical board’s website, here:
                    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('http://www.okmedicalboard.org/complaint')}>http://www.okmedicalboard.org/complaint.</Text>
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Rhode Island: If I use e-mail or text-based technology to communicate with a Provider, then I understand the types of transmissions that will be permitted and the circumstances when alternate forms of communication should be utilized. I have also discussed security measures, such as encryption of data, password protected screen savers and data files, or utilization of other reliable authentication techniques, as well as potential risks to privacy.
                </Text>
                <Text style={styles.consentModalPara}>
                    •	South Carolina: I understand my medical records may be distributed in accordance with applicable law and regulation to other treating health care practitioners. (S.C. Code Ann. § 40-47-37).
                </Text>
                <Text style={styles.consentModalPara}>
                    •	Texas: The Texas Behavioral Health Executive Council investigates and prosecutes professional misconduct committed by marriage and family therapists, professional counselors, psychologists, psychological associates, social workers, and licensed specialists in school psychology. Although not every complaint against or dispute with a licensee involves professional misconduct, the Executive Council will provide you with information about how to file a complaint. Please call 1-800-821-3205 for more information.
                </Text>
                {/*<Text style={styles.consentModalPara}>*/}
                {/*    •	Wisconsin: To learn more about your rights as a behavioral health patient in Wisconsin, please visit {"\n"}*/}
                {/*    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://www.dhs.wisconsin.gov/publications/p2/p23112.pdf')}>https://www.dhs.wisconsin.gov/publications/p2/p23112.pdf</Text>*/}
                {/*        to review a pamphlet published by the State of Wisconsin Department of Health Services. The pamphlet is also available in Hmong {" "}*/}
                {/*    <Text style={{color: 'blue'}}  onPress={() => Linking.openURL('https://www.dhs.wisconsin.gov/publications/p2/p23112h.pdf')}>https://www.dhs.wisconsin.gov/publications/p2/p23112h.pdf</Text>*/}
                {/*    {' '}and Spanish.{"\n"}*/}
                {/*    <Text style={{color: 'blue'}} onPress={() => Linking.openURL('https://www.dhs.wisconsin.gov/publications/p2/p23112s.pdf')}>https://www.dhs.wisconsin.gov/publications/p2/p23112s.pdf</Text>*/}
                {/*</Text>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    consentModalTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 24
    },
    consentSectionB: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignItems: 'center',
        marginBottom: 24
    },
    consentModalParCapital: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginBottom: 24
    },
    consentModalPara: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.lowContrast,
        marginBottom: 16
    },
    consentMainText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    consentSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 32
    }
});
