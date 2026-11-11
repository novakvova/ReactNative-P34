import {Stack} from 'expo-router';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {KeyboardProvider} from "react-native-keyboard-controller";
import {Provider} from "react-redux";
import {store} from "@/store";
import {useEffect, useState} from "react";
import * as SecureStore from 'expo-secure-store';
import {loginSuccess} from "@/store/reducers/AuthSlice";


export default function TabLayout() {
    const [storeReady, setStoreReady] = useState<boolean>(false);

    useEffect(() => {
        initStore().then(()=>{
            setStoreReady(true);
        })
    });

    const initStore = async (): Promise<void> => {
        const token = await SecureStore.getItemAsync("token");
        if(token) {
            store.dispatch(loginSuccess(token));
        }
    }

    console.log("initStore", storeReady);

    if(!storeReady)
        return null;

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <KeyboardProvider>
                    <Stack screenOptions={{headerShown: false}}/>
                </KeyboardProvider>
            </SafeAreaProvider>
        </Provider>
    )
}
