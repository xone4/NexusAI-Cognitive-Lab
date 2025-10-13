import React from 'react';
import {
  BrainCircuit,
  LayoutDashboard,
  Copy,
  Hammer,
  Network,
  Cpu,
  Beaker,
  CodeXml,
  Database,
  Box,
  Users,
  FunctionSquare,
  Globe,
  Eye,
  CheckCircle,
  Clock,
  Cog,
  FileText,
  FileSearch,
  Trash2,
  Columns,
  ArrowRightLeft,
  Flame,
  Pencil,
  User,
  PlusCircle,
  XCircle,
  Lightbulb,
  Search,
  Archive,
  Wrench,
  Link,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Undo2,
  BookOpen,
  Play,
  RefreshCw,
  Dna,
  Image,
  Sparkles,
  Share2,
  ArchiveRestore,
  MessagesSquare,
  ChevronDown,
  PieChart,
  ChevronLeft,
  ChevronRight,
  MessageCircleMore,
  Dices,
  type LucideProps,
} from 'lucide-react';

// Generic Icon Props, compatible with Lucide
type IconProps = LucideProps;

const DEFAULT_STROKE_WIDTH = 1.5;

export const BrainCircuitIcon: React.FC<IconProps> = (props) => <BrainCircuit {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const DashboardIcon: React.FC<IconProps> = (props) => <LayoutDashboard {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ReplicaIcon: React.FC<IconProps> = (props) => <Copy {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ToolIcon: React.FC<IconProps> = (props) => <Hammer {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArchIcon: React.FC<IconProps> = (props) => <Network {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const CpuChipIcon: React.FC<IconProps> = (props) => <Cpu {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const BeakerIcon: React.FC<IconProps> = (props) => <Beaker {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const CodeBracketIcon: React.FC<IconProps> = (props) => <CodeXml {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const CircleStackIcon: React.FC<IconProps> = (props) => <Database {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const CubeTransparentIcon: React.FC<IconProps> = (props) => <Box {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const UserGroupIcon: React.FC<IconProps> = (props) => <Users {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const VariableIcon: React.FC<IconProps> = (props) => <FunctionSquare {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const GlobeAltIcon: React.FC<IconProps> = (props) => <Globe {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const EyeIcon: React.FC<IconProps> = (props) => <Eye {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const CheckCircleIcon: React.FC<IconProps> = (props) => <CheckCircle {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ClockIcon: React.FC<IconProps> = (props) => <Clock {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const CogIcon: React.FC<IconProps> = (props) => <Cog {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const DocumentTextIcon: React.FC<IconProps> = (props) => <FileText {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const DocumentMagnifyingGlassIcon: React.FC<IconProps> = (props) => <FileSearch {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const TrashIcon: React.FC<IconProps> = (props) => <Trash2 {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ViewColumnsIcon: React.FC<IconProps> = (props) => <Columns {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArrowsRightLeftIcon: React.FC<IconProps> = (props) => <ArrowRightLeft {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const FireIcon: React.FC<IconProps> = (props) => <Flame {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const PencilIcon: React.FC<IconProps> = (props) => <Pencil {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const UserIcon: React.FC<IconProps> = (props) => <User {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const PlusCircleIcon: React.FC<IconProps> = (props) => <PlusCircle {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const XCircleIcon: React.FC<IconProps> = (props) => <XCircle {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const LightBulbIcon: React.FC<IconProps> = (props) => <Lightbulb {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const MagnifyingGlassIcon: React.FC<IconProps> = (props) => <Search {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArchiveBoxIcon: React.FC<IconProps> = (props) => <Archive {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const WrenchScrewdriverIcon: React.FC<IconProps> = (props) => <Wrench {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const LinkIcon: React.FC<IconProps> = (props) => <Link {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArrowUpIcon: React.FC<IconProps> = (props) => <ArrowUp {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArrowDownIcon: React.FC<IconProps> = (props) => <ArrowDown {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArrowRightIcon: React.FC<IconProps> = (props) => <ArrowRight {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArrowUturnLeftIcon: React.FC<IconProps> = (props) => <Undo2 {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const BookOpenIcon: React.FC<IconProps> = (props) => <BookOpen {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const PlayIcon: React.FC<IconProps> = (props) => <Play {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const RefreshIcon: React.FC<IconProps> = (props) => <RefreshCw {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const DnaIcon: React.FC<IconProps> = (props) => <Dna {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const PhotographIcon: React.FC<IconProps> = (props) => <Image {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const SparklesIcon: React.FC<IconProps> = (props) => <Sparkles {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ShareIcon: React.FC<IconProps> = (props) => <Share2 {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ArchiveBoxArrowDownIcon: React.FC<IconProps> = (props) => <ArchiveRestore {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ChatBubbleLeftRightIcon: React.FC<IconProps> = (props) => <MessagesSquare {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ChevronDownIcon: React.FC<IconProps> = (props) => <ChevronDown {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ChartPieIcon: React.FC<IconProps> = (props) => <PieChart {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ChevronLeftIcon: React.FC<IconProps> = (props) => <ChevronLeft {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ChevronRightIcon: React.FC<IconProps> = (props) => <ChevronRight {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const ChatBubbleBottomCenterTextIcon: React.FC<IconProps> = (props) => <MessageCircleMore {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;
export const DicesIcon: React.FC<IconProps> = (props) => <Dices {...props} strokeWidth={props.strokeWidth ?? DEFAULT_STROKE_WIDTH} />;