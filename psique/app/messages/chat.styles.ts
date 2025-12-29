import { StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../../src/theme';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.offWhite 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  msgMine: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.green,
    borderBottomRightRadius: 4,
  },
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
  },
  input: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  },
});