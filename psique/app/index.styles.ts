import { StyleSheet, Platform } from 'react-native';

// CORES ATUALIZADAS
const Colors = {
  black: '#0E0E0E',
  gray: '#2B2B2B',
  offWhite: '#F5F4F2',
  green: '#5FF0A9',
  peach: '#FFB994',
  lilac: '#C7B5FF',
  blue: '#6E8AFF',
  coral: '#FF6B8B',
  teal: '#2EE6CA',
  white: '#FFFFFF',
  lightGray: '#E5E5E5',
  mediumGray: '#999999'
};

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.offWhite 
  },
  
  loadingScreen: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.offWhite 
  },
  
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: Colors.gray 
  },

  // KEYBOARD & SCROLL
  keyboardView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
  },

  // CONTENT AREA
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },

  // HEADER
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: -1,
  },

  // CENTER CONTENT
  center: {
    alignItems: 'center',
    width: '100%',
  },
  
  tagline: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  
  hero: {
    marginBottom: 24,
    alignItems: 'center',
  },
  
  heroLine1: {
    fontSize: 36,
    fontWeight: '300',
    color: Colors.black,
    fontFamily: 'Inter-Light',
    textAlign: 'center',
  },
  
  heroLine2: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  
  description: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },

  // INPUT
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  
  input: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter-Regular',
  },
  
  inputError: {
    borderColor: Colors.coral,
  },
  
  errorText: {
    color: Colors.coral,
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  // BUTTONS
  button: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.black,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  
  signupButton: {
    marginBottom: 16,
    alignItems: 'center',
  },
  
  signupText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },
  
  signupTextBold: {
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Inter-Bold',
  },
  
  forgotButtonInline: {
    marginBottom: 24,
    alignItems: 'center',
  },
  
  forgotTextInline: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Inter-Regular',
  },

  // OR DIVIDER
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  
  orText: {
    marginHorizontal: 16,
    color: Colors.gray,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },

  // GOOGLE BUTTON
  googleButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginBottom: 24,
  },
  
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray,
    fontFamily: 'Inter-Bold',
  },
  
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    fontFamily: 'Inter-SemiBold',
  },

  // DIVIDER
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 24,
    width: '100%',
  },
  
  call: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '600',
    marginBottom: 40,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  
  footer: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    marginTop: 20,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  
  modalText: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  
  modalInput: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  
  cancelButtonText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  
  confirmButton: {
    backgroundColor: Colors.black,
  },
  
  confirmButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

// Exportar cores também se necessário
export { Colors };