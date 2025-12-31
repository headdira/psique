import { StyleSheet, Platform } from 'react-native';
<<<<<<< HEAD
import { Colors, Spacing, Typography } from '../../src/theme';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.offWhite 
=======
import { Colors } from '../../src/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
>>>>>>> psique.dev
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: { 
    marginRight: Spacing.md 
  },
  backText: { 
    fontSize: 24, 
    color: Colors.black 
  },
  title: { 
    ...Typography.h3, 
    fontSize: 18 
  },
  chatContent: { 
    padding: Spacing.md, 
    paddingBottom: 20 
  },
  msgBubble: {
=======
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.black,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  bubble: {
>>>>>>> psique.dev
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
<<<<<<< HEAD
  msgMine: {
=======
  myBubble: {
>>>>>>> psique.dev
    alignSelf: 'flex-end',
    backgroundColor: Colors.green,
    borderBottomRightRadius: 4,
  },
<<<<<<< HEAD
  msgOther: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  msgText: { 
    fontSize: 15, 
    color: Colors.black 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    alignItems: 'center',
=======
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderBottomLeftRadius: 4,
  },
  textMine: {
    color: Colors.white,
    fontSize: 15,
  },
  textOther: {
    color: Colors.black,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
>>>>>>> psique.dev
  },
  input: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
<<<<<<< HEAD
    marginRight: 8,
    fontSize: 15,
  },
  sendButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 10 
  },
  sendText: { 
    color: Colors.green, 
    fontWeight: 'bold', 
    fontSize: 16 
=======
    fontSize: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  sendButton: {
    backgroundColor: Colors.black,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
>>>>>>> psique.dev
  },
});