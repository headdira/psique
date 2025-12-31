import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../src/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  
  // Balões de Mensagem
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.green, // Cor da marca (Verde)
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderBottomLeftRadius: 4,
  },
  
  // Textos
  textMine: {
    color: Colors.white, // Texto branco no fundo verde
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  textOther: {
    color: Colors.black, // Texto preto no fundo branco
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  
  // Input Area
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    // Ajuste para iPhone X+
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    color: Colors.black,
    maxHeight: 100, // Limite para multiline
  },
  sendButton: {
    backgroundColor: Colors.black,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.5,
  }
});