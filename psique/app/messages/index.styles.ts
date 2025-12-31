import { StyleSheet } from 'react-native';
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
    fontSize: 20 
  },
  listContent: { 
    padding: Spacing.md 
=======
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingTop: 50, // Ajuste para safe area
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    fontFamily: 'Montserrat-Bold',
  },
  listContent: {
    padding: 16,
>>>>>>> psique.dev
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
<<<<<<< HEAD
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: Spacing.md, 
    backgroundColor: '#ddd' 
  },
  chatInfo: { 
    flex: 1 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4 
  },
  name: { 
    ...Typography.h3, 
    fontSize: 16 
  },
  time: { 
    ...Typography.caption, 
    fontSize: 12 
  },
  lastMsg: { 
    ...Typography.bodySmall, 
    color: Colors.gray 
  },
  badge: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: Colors.black 
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 50 
  },
  emptyText: { 
    ...Typography.h3, 
    color: Colors.gray 
  },
  emptySubText: { 
    ...Typography.bodySmall, 
    marginTop: 8, 
    color: Colors.gray 
  },
=======
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: Colors.lightGray,
  },
  chatInfo: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },
  time: {
    fontSize: 12,
    color: Colors.gray,
  },
  lastMsg: {
    fontSize: 14,
    color: Colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.gray,
  }
>>>>>>> psique.dev
});