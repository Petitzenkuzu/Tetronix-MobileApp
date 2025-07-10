import { View, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useEffect, useRef } from 'react';
import Profile from './Profile';
import Home from './Home';
import Leaderboard from './LeaderBoard';
import { User } from '@/types/auth';
let pagerRefGlobal: React.RefObject<PagerView|null> | null = null;
export function setPage(page : number) {
  pagerRefGlobal?.current?.setPage(page);
}
export default function Pager({user,leaderboard, handlePageChange}: {user: User, leaderboard: User[], handlePageChange: (page: number) => void}) {
  const pagerRef = useRef<PagerView|null>(null);

  pagerRefGlobal = pagerRef;
    return (
        <PagerView style={{flex: 1, justifyContent: "center", alignItems: "center"}} initialPage={1} ref={pagerRef} onPageSelected={(event) => {
            handlePageChange(event.nativeEvent.position);
        }}>
                <View style={{width: '100%', height: '100%'}} key="1">
                    <Profile user={user}/>
                </View>
                <View style={{width: '100%', height: '100%'}} key="2">
                  <Home user={user}/>
                </View>
                <View style={{width: '100%', height: '100%'}} key="3">
                  <Leaderboard leaderboard={leaderboard}/>
                </View>
        </PagerView>
    );
}