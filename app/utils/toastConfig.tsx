import { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#84cc16",
        height: 70,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "400",
      }}
      text2NumberOfLines={2}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ef4444",
        height: 70,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "400",
      }}
      text2NumberOfLines={2}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={{
        borderLeftColor: "#3b82f6",
        height: 70,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
      }}
      text2Style={{
        fontSize: 14,
        fontWeight: "400",
      }}
      text2NumberOfLines={2}
    />
  ),
};
