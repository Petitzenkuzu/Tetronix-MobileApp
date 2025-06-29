import { View, Text, Image, StyleSheet, Pressable, Modal } from "react-native";
import { useState } from "react";
import { User } from "@/types/auth";
export default function BandeauUtilisateur({user, handleLogout}:{user:User, handleLogout:() => void}) {
    const styles = StyleSheet.create({
        bandeau: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            height:'70%', 
            width: "98%",
            borderRadius: 25,
        

        }
    })
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const stylesImage = StyleSheet.create({
        imageContainer: {
            width: 50,
            height: 50,
            backgroundColor: "#000B58",
            borderRadius: 15,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
        },
        image: {
            width: 30,
            height: 30,
            tintColor: "white",
            transform: [{rotate: `${isMenuOpen ? '90deg' : '0deg'}`}],
        },
    })

    const stylesUser = StyleSheet.create({
        text: {
            color: "white",
            fontSize: 25,
            fontFamily: "Quicksand",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textTransform: "uppercase",
            lineHeight: 50,
        },
        textContainer: {
            backgroundColor: "#000B58",
            alignItems: "center",
            justifyContent: "center",
            width: "55%",
            height: 50,
            borderRadius: 15,
            overflow: "hidden",
            marginLeft: 5,
        },
        menuContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        menuItem: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            width: "65%",
            height: "15%",
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
        },
        LogoutMessage: {
            flex : 1,
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
        },
        LogoutButtons: {
            height: 35,
            width: "100%",
            borderRadius: 10,
            justifyContent: "space-evenly",
            alignItems: "center",
            marginBottom: 10,
            flexDirection: "row",
        },
        choiceButton: {
            width: "30%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            alignSelf: "center",
        }
    });
    return (
        <View style={styles.bandeau}>
            <View style={stylesUser.textContainer}>
                <Text style={stylesUser.text}>{user.name}</Text>
            </View>
            <Pressable style={stylesImage.imageContainer} onPress={() => setIsMenuOpen(!isMenuOpen)}>
                <Image source={require("@/assets/images/logout.png")} style={stylesImage.image} />
            </Pressable>
            <Modal visible={isMenuOpen} transparent={true} animationType="slide">
                <Pressable style={{width: "100%", height: "100%"}} onPress={() => {0
                    setIsMenuOpen(false);
                }}>
                <View style={stylesUser.menuContainer}>
                    <Pressable style={stylesUser.menuItem} onPress={() => {}}>
                    <View style={{width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
                        <View style={stylesUser.LogoutMessage}>
                            <Text style={{color: "white", fontSize: 24, fontFamily: "Quicksand", textAlign: "center"}}>Disconnect ?</Text>
                        </View>
                        <View style={stylesUser.LogoutButtons}>
                                <Pressable style={stylesUser.choiceButton} onPress={() => {
                                    setIsMenuOpen(false);
                                }}>
                                    <Text style={{color: "#57B9FF", fontSize: 24, fontFamily: "Quicksand", textAlign: "center"}}>NO</Text>
                                </Pressable>

                                <Pressable style={stylesUser.choiceButton} onPress={() => {
                                    handleLogout();
                                }}>
                                    <Text style={{color: "red", fontSize: 24, fontFamily: "Quicksand", textAlign: "center"}}>YES</Text>
                                </Pressable>
                        </View>
                    </View>
                    </Pressable>
                </View>
                </Pressable>
            </Modal>
        </View>
    );
}