import { inject, observer } from "mobx-react"
import * as React from "react"
import { Dimensions, StyleSheet, Text, View, SafeAreaView } from "react-native"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { Screen } from "../../components/screen"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { getRemainingEarnItems, isSectionComplete } from "../earns-screen"
import BitcoinCircle from "./bitcoin-circle-01.svg"
import BottomOngoing from "./bottom-ongoing-01.svg"
import BottomStart from "./bottom-start-01.svg"
import LeftLastComplete from "./left-finished-01.svg"
import LeftComplete from "./left-section-completed-01.svg"
import LeftOngoing from "./left-section-ongoing-01.svg"
import LeftTodo from "./left-section-to-do-01.svg"
import RightFirst from "./right-first-section-to-do-01.svg"
import RightLastOngoing from "./right-last-section-ongoing-01.svg"
import RightLastTodo from "./right-last-section-to-do-01.svg"
import RightComplete from "./right-section-completed-01.svg"
import RightOngoing from "./right-section-ongoing-01.svg"
import RightTodo from "./right-section-to-do-01.svg"
import TextBlock from "./text-block-medium.svg"
import Top from "./top-01.svg"


const { width: screenWidth } = Dimensions.get("window")

const styles = StyleSheet.create({
  mainView: {
    alignSelf: "center"
  },

  textStyleBox: {
    color: palette.white,
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
  },

  icon: {
    marginHorizontal: 10,
    marginBottom: 6,
  },
})

type SideType = "left" | "right"
interface IInBetweenTile {
  side: SideType
  position: number
}

interface IBoxAdding {
  text: string
  section: string
  Icon: React.Component
  side: SideType
  position: number 
}

interface ISectionData {
  text: string
  id: string
  icon: React.Component
}

interface IEarnMapScreen {
  navigation: object //FIXME
  currSection: number
  progress: number
  sectionsData: ISectionData[]
}

export const ProgressBar = ({progress}) => {
  const balanceWidth = `${progress * 100}%`

  return (
  <View style={{ backgroundColor: palette.darkGrey, margin: 10 }}>
    <View style={{ width: balanceWidth, height: 3, backgroundColor: palette.white }} />
  </View>
)}


export const EarnMapDataInjected = inject("dataStore")(
  observer(({ dataStore, navigation }) => {

  // FIXME sectionId rely on array index. use id instead
  const sectionId = Object.keys(translate("EarnScreen.earns"))
  let sectionsData = []
  let currSection = 0
  let progress = NaN

  
  for (let section of sectionId) {
    sectionsData.push({
      id: section,
      text: translate(`EarnScreen.earns\.${section}.meta.title`),
      icon: BitcoinCircle,
    })

    if (isSectionComplete({section, dataStore})) {
      currSection += 1
    } else if (isNaN(progress)) { // only do it once for the first uncompleted section
      progress = getRemainingEarnItems({section, dataStore})
    }
  }

  return <EarnMapScreen 
    navigation={navigation}
    sectionsData={sectionsData}
    currSection={currSection}
    progress={progress}
  />

}))

export const EarnMapScreen: React.FC<IEarnMapScreen> = 
  ({ navigation, sectionsData, currSection, progress}) => {

  const InBetweenTile: React.FC<IInBetweenTile> = ({ side, position }) => {
    if (currSection < position) {      
      if (position === 9) {
        return <RightLastTodo />
      }

      return side === "left" ? <LeftTodo /> : <RightTodo />
    } else if (currSection === position) {
      if (position === 9) {
        return <RightLastOngoing />
      }

      if (position === 0 && progress === 0) {
        return <RightFirst />
      }

      return side === "left" ? <LeftOngoing /> : <RightOngoing />
    } else {
      return side === "left" ? <LeftComplete /> : <RightComplete />
    }
  }

  const BoxAdding: React.FC<IBoxAdding> = ({ text, Icon, side, position, section }) => {
    const disabled = currSection < position
    const progressSection = disabled ? 0 : currSection > position ? 1 : progress
    return (<View>
      <InBetweenTile side={side} position={position}/>
      <View style={{
        position: "absolute", 
        bottom: currSection === position ? 80 : 30, 
        left: side === "left" ? 35 : 200,
        opacity: disabled ? .5: 1,
        }}>
        <View>
          <TouchableOpacity disabled={disabled} 
            onPress={() => navigation.navigate("earnsSection", { section })}>
            <TextBlock />
            <View style={{position: "absolute", width: "100%"}}>
              <ProgressBar progress={progressSection} />
              <Icon style={styles.icon} width={50} height={50} />
              <Text style={styles.textStyleBox}>{text}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )}

  let sectionsComp = []

  sectionsData.forEach((item, index) => {
    sectionsComp.unshift(
    <BoxAdding  text={item.text}
                Icon={item.icon} 
                side={index % 2 ? "left":"right"} 
                position={index}
                section={item.id} />
  )})

  const scrollViewRef = React.createRef()

  React.useEffect(() => {
    scrollViewRef.current.scrollToEnd()
  }, [])

  return (
    <Screen unsafe={true} >
        <SafeAreaView style={{backgroundColor: palette.sky, minHeight: "6%"}} />
        <ScrollView 
          // removeClippedSubviews={true}
          style={{backgroundColor: palette.sky}}
          contentContainerStyle={{
            backgroundColor: palette.lightBlue, 
            flexGrow: 1,
          }}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            scrollViewRef.current.scrollToEnd()
          }}
        >
        <View style={{backgroundColor: palette.sky}}>
          <Top width={screenWidth} />
        </View>
        <View style={styles.mainView}>
          { currSection === 10 ? <LeftLastComplete /> : null }
          { sectionsComp }
          { currSection === 0 ?
              progress === 0 ?
                  <BottomStart />
                : <BottomOngoing /> 
              : null
          }
        </View>
      </ScrollView>
    </Screen>
  )
}
