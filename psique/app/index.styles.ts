import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../src/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? Spacing.lg : Spacing.xl,
    marginBottom: Spacing.md,
  },
  logo: {
    ...Typography.h1,
    color: Colors.black,
    letterSpacing: -1,
    fontSize: 28,
  },
  center: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    fontSize: 10,
  },
  hero: {
    marginBottom: Spacing.md,
  },
  heroLine1: {
    fontSize: 40,
    fontWeight: '300',
    fontFamily: 'Inter-Regular', 
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 40,
  },
  heroLine2: {
    fontSize: 40,
    fontWeight: '900',
    fontFamily: 'Montserrat-Bold',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -1.5,
  },
  description: {
    ...Typography.body,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    fontSize: 14,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.black,
    height: 48,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#FF6B6B',
    marginTop: 4,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.green,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: 0,
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.button,
    color: Colors.black,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  
  // === NOVOS ESTILOS VERTICAIS ===
  signupButton: {
    marginTop: 16,
    padding: 4,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  signupTextBold: {
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
  forgotButtonInline: {
    marginTop: 8,
    padding: 4,
    alignItems: 'center',
  },
  forgotTextInline: {
    fontSize: 13,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'underline',
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  orText: {
    ...Typography.caption,
    color: Colors.gray,
    marginHorizontal: Spacing.md,
    fontSize: 12,
  },
  googleButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    width: '100%',
    height: 48,
    marginBottom: Spacing.md,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  googleIconText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButtonText: {
    ...Typography.button,
    color: Colors.black,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: Colors.black,
    marginVertical: Spacing.lg,
    opacity: 0.1,
  },
  call: {
    ...Typography.body,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontSize: 14,
  },
  footer: {
    ...Typography.caption,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 'auto',
    paddingBottom: Spacing.lg,
    fontSize: 11,
  },

  // === ESTILOS DO MODAL ===
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.black,
    marginBottom: Spacing.md,
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
  },
  modalText: {
    ...Typography.body,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontSize: 14,
  },
  modalInput: {
    width: '100%',
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: 15,
    color: Colors.black,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  confirmButton: {
    backgroundColor: Colors.green,
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-SemiBold',
  },
  confirmButtonText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },
});