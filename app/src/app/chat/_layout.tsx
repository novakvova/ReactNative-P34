import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {Stack} from "expo-router";

const ChatLayout = () => {
    return (
        <SafeAreaView className="flex-1">
            {/* Прокручує до активного поля, щоб клавіатура його не перекривала */}
            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerClassName="flex-grow px-6 py-10"
                keyboardShouldPersistTaps="handled"
                bottomOffset={24}
                showsVerticalScrollIndicator={false}
            >
                <Stack screenOptions={{headerShown: false}}/>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default ChatLayout;